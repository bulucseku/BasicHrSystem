package com.sentrana.appshell.serialization

import org.apache.commons.lang3.StringEscapeUtils

trait TableSerializer {
  def serialize[R](
    tabularData:  Seq[R],
    rowToStrings: R => Seq[String],
    headers:      Option[Seq[String]] = None
  ): String = {
    val stringRows = tabularData map rowToStrings
    val withHeaders = headers map (_ +: stringRows) getOrElse stringRows
    serialize(withHeaders, identity[String] _)
  }

  def serialize[A](tabularData: Seq[Seq[A]], valueToString: A => String): String

  def deserialize[A](data: String, constructor: String => A): Seq[Seq[A]]
}

class TototoshiCsvSerializer(
    val valueDelimiter: String = ",",
    val rowDelimiter:   String = "\r\n",
    val quoteCharacter: String = "\""
) extends TableSerializer {

  import com.github.tototoshi.csv._

  implicit object MyFormat extends DefaultCSVFormat {
    override val delimiter = valueDelimiter.charAt(0)
    override val quoteChar = quoteCharacter.charAt(0)
    override val lineTerminator = rowDelimiter
    override val quoting = QUOTE_ALL
  }

  override def serialize[A](tabularData: Seq[Seq[A]], valueToString: A => String): String = {
    val stringWriter = new java.io.StringWriter()
    val csvWriter = CSVWriter.open(stringWriter)
    val stringData = tabularData.map{ _.map{ valueToString } }
    csvWriter.writeAll(stringData)
    stringWriter.toString
  }

  override def deserialize[A](data: String, constructor: String => A): Seq[Seq[A]] = {
    val stringReader = new java.io.StringReader(data)
    val csvReader = CSVReader.open(stringReader)
    csvReader.all.map{ _.map{ constructor } }
  }

}

class CsvSerializer(
    val valueDelimiter: String = ",",
    val rowDelimiter:   String = "\r\n",
    val quoteCharacter: String = "\""
) extends TableSerializer {

  private def escape(s: String): String = StringEscapeUtils.escapeJava(s)
  private def unescape(s: String): String = StringEscapeUtils.unescapeJava(s)

  lazy val valuePattern: String = {
    val valDelim = escape(unescape(valueDelimiter))
    val quote = escape(unescape(quoteCharacter))
    raw"""(?x)                                    # free-spacing mode
      \G                                          # current match starts at end of last match

      (?<value>                                   # cell value contains:
        (?:                                       #   one or more of:
          (?! \r?\n | $valDelim | $quote ) .      #     non-delimiter, non-quote character, or
        | $quote                                  #     quoted string containing:
          (?:
            (?! \r?\n | $quote ) .                #       any character except row delimiter or quote, or
          | $quote $quote                         #       quote escaped as double quote
          )*
          $quote                                  #     end quote
        )+
      )

      (?:                                         # value separator:
        $valDelim                                 #   value delimiter, or
      | (?<eor>                                   #   one or more end-of-row tokens:
          \r?\n                                   #     newline with optional carriage return, or
        | (?<eof> \z )                            #     end-of-file
        )+
      )"""
  }

  private lazy val valueRegex = valuePattern.r

  private def quoteAndEscape(value: String): String = {
    val escaped = value.replace(quoteCharacter, quoteCharacter + quoteCharacter)
    s"$quoteCharacter$escaped$quoteCharacter"
  }

  override def serialize[A](tabularData: Seq[Seq[A]], valueToString: A => String): String = {
    val valDelim = unescape(valueDelimiter)
    val rowDelim = unescape(rowDelimiter)
    val stringRows = tabularData.map{ row =>
      row.map(valueToString).map(quoteAndEscape).mkString(valDelim)
    }
    stringRows.mkString(rowDelim)
  }

  override def deserialize[A](data: String, constructor: String => A): Seq[Seq[A]] = {
    import collection.mutable.ArrayBuffer

    val rowBuffer = ArrayBuffer[Seq[A]]()
    val valueBuffer = ArrayBuffer[A]()

    val matcher = valueRegex.pattern.matcher(data)

    while (matcher.find()) {
      Option(matcher.group("value")).foreach{ value =>
        val quote = unescape(quoteCharacter)
        val unquoted = value.stripPrefix(quote).stripSuffix(quote).replace(s"$quote$quote", quote).trim
        valueBuffer += constructor(unquoted)
      }
      Option(matcher.group("eor")).foreach{ _ =>
        rowBuffer += valueBuffer.toList
        valueBuffer.clear()
      }
    }

    rowBuffer
  }

}
